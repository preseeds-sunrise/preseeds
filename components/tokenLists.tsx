import { useState } from "react";
import { Address, zeroAddress } from "viem";
import { useReadContract } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import TokenCard from "./tokenCard";
import Link from "next/link";
import FactoryAbi from "@abis/Factory.json";
import { FACTORY_ADDRESS, storage, network } from "@config/index";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

interface Token {
  token: Address;
  isPoolCreated: boolean;
  name: string;
  symbol: string;
  image: string;
  raisedAmount: bigint;
  targetLiquidity: bigint;
  unlockDate: bigint;
}

const TokenLists = () => {
  const [startAddress, setStartAddress] = useState<Address>(
      "0x0000000000000000000000000000000000000001"
  );
  const [pageCount, setPageCount] = useState<number>(1);
  const [previousPageCount, setPreviousPageCount] = useState<Address[]>([]);

  const { data: tokenCount, isLoading: isTokenCountLoading } = useReadContract({
    config: getDefaultConfig({
      appName: "Preseeds Trade",
      projectId: "YOUR_PROJECT_ID",
      chains: [network],
      ssr: true,
    }),
    abi: FactoryAbi,
    address: FACTORY_ADDRESS,
    functionName: "tokenCount",
    args: [],
  });

  const { data, isLoading } = useReadContract({
    config: getDefaultConfig({
      appName: "Preseeds Trade",
      projectId: "YOUR_PROJECT_ID",
      chains: [network],
      ssr: true,
    }),
    abi: FactoryAbi,
    address: FACTORY_ADDRESS,
    functionName: "getTokenInfos",
    args: [startAddress, 9],
  });

  const filteredData = (data as Token[])?.filter(
      (token: Token) => token.token !== zeroAddress
  );

  const handleNext = () => {
    setPreviousPageCount((prev) => [...prev, startAddress]);
    setPageCount(pageCount + 1);
    setStartAddress(filteredData[filteredData.length - 1].token);
  };

  const handlePrevious = () => {
    if (pageCount > 1) {
      const lastAddress = previousPageCount[previousPageCount.length - 1];
      setStartAddress(lastAddress);
      setPreviousPageCount((prev) => prev.slice(0, -1));
      setPageCount(pageCount - 1);
    }
  };

  const handleBackToFirst = () => {
    setPageCount(1);
    setStartAddress("0x0000000000000000000000000000000000000001");
    setPreviousPageCount([]);
  };

  if (isLoading || isTokenCountLoading) {
    return <div>Loading</div>;
  }

  return (
      <div className="container mx-auto mb-10">
        {filteredData && filteredData.length > 0 ? (
            <>
              <div>Total tokens: {(tokenCount as bigint).toString()}</div>
              <div className="flex justify-between mb-8">
                <button
                    className={`bg-gray-700 px-4 py-2 ${
                        pageCount === 1 ? "text-gray-400" : "text-white"
                    }`}
                    onClick={handleBackToFirst}
                    disabled={pageCount === 1}
                >
                  Back to first
                </button>
                <div className={'flex-row flex'}>
                  <button
                      className="text-white px-2 py-2"
                      onClick={handlePrevious}
                      disabled={pageCount === 1}
                  >
                    <FaAngleDoubleLeft size={20} />
                  </button>
                  <div className={"py-2 text-xl text-bold"}>{pageCount}</div>
                  <button
                      className="text-white px-2 py-2"
                      onClick={handleNext}
                      disabled={filteredData.length < 9}
                  >
                    <FaAngleDoubleRight size={20} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.map((token, index) => (
                    <Link href={`/token/${token.token}`} key={index} passHref>
                      <TokenCard
                          name={token.name}
                          isPoolCreated={token.isPoolCreated}
                          symbol={token.symbol}
                          avatar={storage.resolveScheme(token.image)}
                          raisedAmount={token.raisedAmount}
                          targetLiquidity={token.targetLiquidity}
                      />
                    </Link>
                ))}
              </div>
            </>
        ) : (
            <div className="text-center text-white mt-10">
              No tokens are currently raising funds. Create yours now!
            </div>
        )}
      </div>
  );
};

export default TokenLists;
