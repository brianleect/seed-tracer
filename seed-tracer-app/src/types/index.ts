export interface FundingInfo {
    type: string;
    hash: string;
    labelsFound: string[];
    sender: string;
    senderNonce: number;
    block: number;
    receiver: string;
    amount: string;
}

export interface ApiResponse {
    age: string;
    nonce: number;
    fundingInfo: FundingInfo[];
}

export interface OverviewProps {
    age: string;
    nonce: number;
    fundingHops: number | string;
    totalHops: number;
    fundingSource: string;
}