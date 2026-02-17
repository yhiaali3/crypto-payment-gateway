import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import Timeline from '../../components/Timeline';
import apiClient from '../../api/apiClient';

const PublicPaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const { data: payment, isLoading, error } = useQuery(['payment', id], async () => {
    const response = await apiClient.get(`/payments/${id}`);
    return response.data;
  }, {
    refetchInterval: 3000, // Polling every 3 seconds
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading payment details</div>;

  if (!payment) return <div>Payment not found</div>;

  const handleCopy = () => {
    navigator.clipboard.writeText(payment.paymentAddress).then(() => {
      setCopySuccess('Copied to clipboard!');
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  const timeRemaining = Math.max(0, new Date(payment.expiresAt).getTime() - Date.now());

  return (
    <div className="p-4 space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-4">Payment Details</h1>
        <div className="space-y-2">
          <p><strong>Amount:</strong> {payment.amount}</p>
          <p><strong>Currency:</strong> {payment.currency}</p>
          <p><strong>Status:</strong> {payment.status}</p>
          <p><strong>Network:</strong> {payment.network}</p>
          <p><strong>Payment Address:</strong> {payment.paymentAddress}</p>
          <p><strong>Time Remaining:</strong> {Math.ceil(timeRemaining / 1000)} seconds</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Payment QR Code</h2>
        <QRCodeSVG value={payment.paymentAddress} size={200} />
      </section>

      <section>
        <button
          onClick={handleCopy}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Copy Address
        </button>
        {copySuccess && <span className="text-green-500 ml-2">{copySuccess}</span>}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Status Timeline</h2>
        <Timeline status={payment.status} />
      </section>
    </div>
  );
};

export default PublicPaymentPage;