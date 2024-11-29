import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { verifyUserAPI } from '~/apis';
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner';

const AccountVerification = () => {
  // Lấy giá trị email và token từ URL
  let [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  // Tạo một state để biết verify thành công hay không
  const [verified, setVerified] = useState(false);
  // Gọi API để verify tài khoản
  useEffect(() => {
    if (email && token) {
      verifyUserAPI({ email, token }).then(() => setVerified(true));
    }
  }, [email, token]);
  // Nếu URL có vấn đề thì sẽ sang trang 404
  if (!email || !token) {
    return <Navigate to="/404" />;
  }

  // Nếu chưa verify xong thì hiện loading
  if (!verified) {
    return <PageLoadingSpinner caption="Verifying your account" />;
  }
  // Cuối cùng nếu không gặp vấn đề gì và verify thành công thì điều hướng về trang login cùng giá trị verifiedEmail
  return <Navigate to={`/login?verifiedEmail=${email}`} />;
};

export default AccountVerification;
