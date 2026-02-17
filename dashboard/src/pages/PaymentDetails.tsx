import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import usePayment from '../api/hooks/usePayment';
import useWebhookLogs from '../api/hooks/useWebhookLogs';
import { QRCodeSVG } from 'qrcode.react';
import Timeline from '../components/Timeline';

// Define the WebhookLog type
interface WebhookLog {
  id: string;
  status: string;
  responseCode: number;
  responseBody: string;
  createdAt: string;
  updatedAt: string;
}

// Define error types for better type safety
interface ApiError {
  message: string;
}

const PaymentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: payment, isLoading: isPaymentLoading, error: paymentError } = usePayment(id);
  const { data: webhookLogs, isLoading: isWebhookLoading, error: webhookError } = useWebhookLogs(id);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  if (isPaymentLoading) return <div>Loading...</div>;
  if (paymentError) {
    const error = paymentError as { message: string };
    return <div>Error: {error.message}</div>;
  }

  if (!payment) return <div>Payment not found</div>;

  // Define logs before the return statement
  const logs = webhookLogs ?? [];

  // Add a type guard for webhookError
  const errorMessage = ((): string => {
    if (webhookError instanceof Error) {
      return webhookError.message;
    }
    if (typeof webhookError === 'string') {
      return webhookError;
    }
    return 'An unknown error occurred';
  })();

  const handleCopy = () => {
    navigator.clipboard.writeText(payment.paymentAddress).then(() => {
      setCopySuccess('Copied to clipboard!');
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  return (
    <div className="p-4 space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-4">Payment Info</h1>
        <div className="space-y-2">
          <p><strong>ID:</strong> {payment.id}</p>
          <p><strong>Amount:</strong> {payment.amount}</p>
          <p><strong>Currency:</strong> {payment.currency}</p>
          <p><strong>Status:</strong> {payment.status}</p>
          <p><strong>Network:</strong> {payment.network}</p>
          <p><strong>Payment Method:</strong> {payment.paymentMethod}</p>
          <p><strong>Payment Address:</strong> {payment.paymentAddress}</p>
          <p><strong>Payment Link:</strong> <a href={payment.paymentLink} target="_blank" rel="noopener noreferrer">{payment.paymentLink}</a></p>
          <p><strong>Created At:</strong> {new Date(payment.createdAt).toLocaleString()}</p>
          <p><strong>Updated At:</strong> {new Date(payment.updatedAt).toLocaleString()}</p>
          <p><strong>Expires At:</strong> {new Date(payment.expiresAt).toLocaleString()}</p>
          {payment.txHash && <p><strong>Transaction Hash:</strong> {payment.txHash}</p>}
          {payment.amountReceived && <p><strong>Amount Received:</strong> {payment.amountReceived}</p>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Status Timeline</h2>
        <Timeline status={payment.status} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Payment QR Code</h2>
        <div className="flex items-center space-x-4">
          <QRCodeSVG value={payment.paymentAddress} size={128} />
          <p>{payment.paymentAddress}</p>
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Copy
          </button>
          {copySuccess && <span className="text-green-500 ml-2">{copySuccess}</span>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Webhook Logs</h2>
        {isWebhookLoading && <div>Loading webhook logs...</div>}
        {Boolean(webhookError) && (
  <div className="text-red-600">
    Error: <span>{errorMessage}</span>
  </div>
)}

        {logs && logs.length > 0 ? (
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Response Code</th>
                <th className="px-4 py-2">Response Body</th>
                <th className="px-4 py-2">Created At</th>
                <th className="px-4 py-2">Updated At</th>
              </tr>
            </thead>
            <tbody>
            
              {logs.map((log: WebhookLog) => (
                <tr key={log.id} className="border-t">
                  <td className="px-4 py-3">{log.id}</td>
                  <td className="px-4 py-3">{log.status}</td>
                  <td className="px-4 py-3">{log.responseCode}</td>
                  <td className="px-4 py-3">{log.responseBody}</td>
                  <td className="px-4 py-3">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{new Date(log.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No webhook logs found.</div>
        )}
      </section>
    </div>
  );
};

export default PaymentDetails;