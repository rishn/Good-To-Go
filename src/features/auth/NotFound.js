
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin, Divider } from 'antd';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(-1); // Go back to the previous page
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer); // Clean up timer on component unmount
  }, [navigate]);

  return (
    <div className="not-found-container">
      <div className="spinner-container">
        <Flex>
          <Spin indicator={<LoadingOutlined style={{ fontSize: '100px', color: '#eee', align: 'center' }} spin />} />
        </Flex>
      </div>

      {/* Transparent Divider */}
      <Divider style={{ borderColor: 'transparent', margin: '20px 0' }} />
      <Divider style={{ borderColor: 'transparent', margin: '20px 0' }} />
      <Divider style={{ borderColor: 'transparent', margin: '20px 0' }} />

      <div align="center">
        <h2 className='body-text' style={{ color: '#fff' }}>Page Not Found</h2>
        <p className='sub-text' style={{ color: '#fff'}}>Redirecting you back...</p>
      </div>
    </div>
  );
};

export default NotFound;
