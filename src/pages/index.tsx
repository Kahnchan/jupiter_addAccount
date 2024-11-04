import { useEffect } from 'react';
import { useRouter } from 'next/router';

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    // 重定向到 referral 页面
    router.push('/referral');
  }, [router]);

  return null; // 或者可以返回一个加载指示器
};

export default IndexPage;
