import type { NextPage } from "next";
import Head from "next/head";
import { Button, Input, Table, message, notification } from 'antd'
import { useCallback, useState } from "react";
import { PublicKey, Connection, VersionedTransaction, } from '@solana/web3.js'
import { getMint }from '@solana/spl-token'
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import axios from "axios";
const validateSolanaAddress = (addr: string) => {
    let publicKey: PublicKey;
    try {
        publicKey = new PublicKey(addr);
        return PublicKey.isOnCurve(publicKey.toBytes());
      } catch (err) {
        return false;
      }
    };


    const hasReferralToken = async (outputMint: string, connection: Connection) => {
        const [feeAccount] = PublicKey.findProgramAddressSync(
            [
              Buffer.from('referral_ata'),
              new PublicKey("HtwBxBy2gzLFPvQLykBAkA9LWV7BEw6KxAX8HbAPJq2").toBuffer(),
              new PublicKey(outputMint).toBuffer(),
            ],
            // jupiter Referral program id
            // hard code https://station.jup.ag/docs/additional-topics/referral-program
            new PublicKey('REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3'),
          );
      
          const accountInfo = await connection.getAccountInfo(feeAccount);
          return { result: Boolean(accountInfo), outputMint }
    }

    type DataType = { address: string, decimals: number };

    const columns = [
        {
          title: '地址',
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: '精度',
          dataIndex: 'decimals',
          key: 'decimals',
        },
      ];


const Home: NextPage = (props) => {
    const [loading, setLoading] = useState(false)
    
    const { publicKey, sendTransaction } = useWallet()

    const [input, setInput]= useState('')
    const { connection } = useConnection()


    const onClick = useCallback(async () => {
        if (!input.trim()){
            return 
        }
        setLoading(true)
        try {
            // const isValidate = validateSolanaAddress(input)
            // console.log('isValidate', isValidate)
            // if (!isValidate) { return }
            const mintAddress = new PublicKey(input);
            const mintInfo = await getMint(connection, mintAddress);
            if (!mintInfo) {
                return 
            }
            const referralRes = await hasReferralToken(mintInfo.address.toBase58(), connection);
            if (referralRes.result) {
                message.info('has referral')
                setInput('')
                return 
            }
            const data = await axios.post('/api/create', {
                mint: mintInfo.address.toBase58(),
                feePayer:publicKey.toBase58(),
            })
            console.log('data', data)
            let latestBlockhash = await connection.getLatestBlockhash()
            const transation = VersionedTransaction.deserialize(Buffer.from(data.data.tx, 'base64'))
            transation.message.recentBlockhash = latestBlockhash.blockhash
                        // Send transaction and await for signature
                        const signature = await sendTransaction(transation, connection);
    
                        // Await for confirmation
                        await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');
            
                        console.log('signature',signature);
                        message.success("success")
                        setInput('')
           
        } finally {
            setLoading(false)
        }


    }, [input, connection, publicKey, sendTransaction])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>Solana Scaffold</title>
        <meta
          name="description"
          content="Solana Scaffold"
        />
      </Head>
      <h1 className="text-3xl font-bold mb-6 text-indigo-600">添加 Token 地址</h1>
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <div style={{ marginBottom: '20px'}} >
          <Input
            placeholder="输入 Token 地址"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: '500px', marginRight: '20px' }}
          />
          <Button type="primary" loading={loading} onClick={onClick}>
            添加
          </Button>
        </div>
        <WalletMultiButton />
      </div>
    </div>
  );
};

export default Home;
