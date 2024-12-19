import type { NextPage } from "next";
import Head from "next/head";
import { Button, Input, message } from "antd";
import { useCallback, useState } from "react";
import { PublicKey, Connection, VersionedTransaction } from "@solana/web3.js";
import { getMint, TokenInvalidAccountOwnerError } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const { TextArea } = Input;
const hasReferralToken = async (outputMint: string, connection: Connection) => {
  const [feeAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("referral_ata"),
      new PublicKey("HtwBxBy2gzLFPvQLykBAkA9LWV7BEw6KxAX8HbAPJq2").toBuffer(),
      new PublicKey(outputMint).toBuffer(),
    ],
    new PublicKey("REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3")
  );

  const accountInfo = await connection.getAccountInfo(feeAccount);
  return { result: Boolean(accountInfo), outputMint };
};

const BulkReferralPage: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [currentAddress, setCurrentAddress] = useState<string | null>(null); // 新增状态变量
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const checkAndSendTransactions = useCallback(
    async (addresses: string[]) => {
      if (addresses.length === 0) {
        return;
      }
      setLoading(true);
      try {
        for (const addr of addresses) {
          if (!addr.trim()) {
            continue; // 跳过空地址
          }
          setCurrentAddress(addr); // 设置当前处理的地址
          const mintAddress = new PublicKey(addr);

          try {
            const mintInfo = await getMint(connection, mintAddress);
            if (!mintInfo) {
              message.error(`地址 ${addr} 不是有效的代币账户`);
              continue; // 如果mint信息不存在，跳过
            }

            const referralRes = await hasReferralToken(
              mintInfo.address.toBase58(),
              connection
            );

            // 如果有推荐Token，跳过
            if (referralRes.result) {
              message.info(`地址 ${addr} 已有推荐Token`);
              continue;
            }

            // 发送交易并等待签名
            const data = await axios.post("/api/create", {
              mint: mintInfo.address.toBase58(),
              feePayer: publicKey.toBase58(),
            });
            console.log("data", data);
            let latestBlockhash = await connection.getLatestBlockhash();
            const transaction = VersionedTransaction.deserialize(
              Buffer.from(data.data.tx, "base64")
            );
            transaction.message.recentBlockhash = latestBlockhash.blockhash;

            // 这里发起钱包签名
            const signature = await sendTransaction(transaction, connection);
            message.success(`地址 ${addr} 的交易已发送，签名: ${signature}`);
          } catch (error) {
            // 捕获特定错误
            if (error instanceof TokenInvalidAccountOwnerError) {
              console.error("无效的代币账户所有者:", error);
              message.error(`地址 ${addr} 的代币账户无效，跳过该地址`);
            } else {
              console.error("交易处理错误:", error);
              message.error(error.message || "处理交易时发生错误");
            }
            // 继续处理下一个地址
          }
        }
      } catch (error) {
        console.error("交易处理错误:", error);
        message.error(error.message || "处理交易时发生错误");
      } finally {
        setLoading(false);
      }
    },
    [connection, publicKey, sendTransaction]
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>Bulk Referral Check</title>
        <meta
          name="description"
          content="Bulk check and send transactions for referral tokens."
        />
      </Head>
      <h1 className="text-3xl font-bold mb-6 text-indigo-600">
        批量检查推荐Token
      </h1>
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <TextArea
          placeholder="输入 Token 地址，每个地址一行"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8} // 设置行数以显示多行
          style={{ width: "100%", marginBottom: "20px" }}
        />
        <Button
          type="primary"
          loading={loading}
          onClick={() => checkAndSendTransactions(input.split("\n"))}
        >
          检查并发送
        </Button>
        <Button
          type="default"
          onClick={() => {
            setCurrentAddress(null);
          }}
        >
          清除
        </Button>
        {currentAddress && <p>正在处理地址: {currentAddress}</p>}{" "}
        {/* 显示当前处理的地址 */}
      </div>
      <WalletMultiButton />
    </div>
  );
};

export default BulkReferralPage;
function processAddress(arg0: any) {
  throw new Error("Function not implemented.");
}
