interface CodeBlockProps {
    code: string
}

export default function CodeBlock({ code }: CodeBlockProps) {
    return (
        <pre className="bg-gray-800 p-4 rounded overflow-x-auto font-mono text-sm">
            <code>{code}</code>
        </pre>
    )
}