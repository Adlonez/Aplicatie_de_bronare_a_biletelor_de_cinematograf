import { Result, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <Result
        status="403" 
        title="401"
        subTitle="You are not logged in. Please log in to continue."
        extra={[
          <Button type="primary" key="login" onClick={() => navigate('/login')}>
            Login
          </Button>,
          <Link to="/" key="home">
            <Button>Home</Button>
          </Link>,
        ]}
      />
    </div>
  );
}