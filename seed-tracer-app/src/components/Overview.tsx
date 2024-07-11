import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { OverviewProps } from '../types';

export default function Overview({ age, nonce, fundingHops, totalHops, fundingSource }: OverviewProps) {
    return (
        <Tooltip.Provider>
            <div className="flex justify-center">
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-4xl">
                    <h2 className="text-2xl font-bold mb-4 text-center">Overview</h2>
                    <div className="grid gap-4">
                        <InfoItem
                            label="Age of Address"
                            value={age}
                            description="The time elapsed since this address was first funded on the blockchain."
                        />
                        <InfoItem
                            label="Funding Source"
                            value={fundingSource}
                            description="The likely origin of funds based on the first labeled address in the trace found."
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <InfoItem
                                label="Nonce"
                                value={nonce.toString()}
                                description="The number of transactions sent from this address."
                            />
                            <InfoItem
                                label="Hops to Funding Source"
                                value={fundingHops.toString()}
                                description="The number of funding transactions between this address and its funding source defined as the first labeled address."
                            />
                            <InfoItem
                                label="Hops to Genesis"
                                value={totalHops.toString()}
                                description="The number of funding transactions between this address and the GENESIS block, the first block of the blockchain."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Tooltip.Provider>
    );
}

interface InfoItemProps {
    label: string;
    value: string;
    description: string;
}

function InfoItem({ label, value, description }: InfoItemProps) {
    return (
        <Tooltip.Root>
            <Tooltip.Trigger asChild>
                <div className="bg-gray-700 rounded-md p-3 cursor-help">
                    <div className="flex justify-between items-center">
                        <span className="font-medium">{label}:</span>
                        <span className="text-blue-300 break-all">{value}</span>
                    </div>
                </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content
                    className="bg-gray-900 text-white p-2 rounded shadow-lg z-50 max-w-xs"
                    sideOffset={5}
                >
                    {description}
                    <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    );
}