import { FundingInfo as FundingInfoType } from '../types'

interface FundingInfoProps {
    fundingInfo: FundingInfoType[]
}

export default function FundingInfo({ fundingInfo }: FundingInfoProps) {
    const truncate = (str: string, length: number = 10): string => {
        return str.length > length ? `${str.substring(0, length)}...` : str
    }

    const etherscanLink = (type: 'tx' | 'address', value: string): string => {
        const baseUrl = 'https://etherscan.io'
        return type === 'tx' ? `${baseUrl}/tx/${value}` : `${baseUrl}/address/${value}`
    }

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Funding Info</h2>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left bg-gray-700">
                        <th className="p-3 rounded-tl-md">Type</th>
                        <th className="p-3">Transaction Hash</th>
                        <th className="p-3">Labels</th>
                        <th className="p-3">Sender</th>
                        <th className="p-3">Nonce</th>
                        <th className="p-3">Block</th>
                        <th className="p-3">Receiver</th>
                        <th className="p-3 rounded-tr-md">Amount (ETH)</th>
                    </tr>
                </thead>
                <tbody>
                    {fundingInfo.map((info, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-750' : 'bg-gray-700'}>
                            <td className="p-3">{info.type}</td>
                            <td className="p-3">
                                <a
                                    href={etherscanLink('tx', info.hash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 transition duration-300"
                                >
                                    {truncate(info.hash, 12)}
                                </a>
                            </td>
                            <td className="p-3">{(info.labelsFound || []).join(', ')}</td>
                            <td className="p-3">
                                <a
                                    href={etherscanLink('address', info.sender)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 transition duration-300"
                                >
                                    {truncate(info.sender, 12)}
                                </a>
                            </td>
                            <td className="p-3">{info.senderNonce}</td>
                            <td className="p-3">{info.block}</td>
                            <td className="p-3">
                                <a
                                    href={etherscanLink('address', info.receiver)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 transition duration-300"
                                >
                                    {truncate(info.receiver, 12)}
                                </a>
                            </td>
                            <td className="p-3">{info.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}