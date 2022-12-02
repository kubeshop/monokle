const Dashboard = ({width, height}: {width?: number; height?: number}) => {
  const iconWidth = width || '22';
  const iconHeight = height || '22';

  return (
    <svg width={iconWidth} height={iconHeight} viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_558_4967)">
        <path
          d="M9.00007 0L1.60889 4.67201V13.3969L9.00007 18.0689L16.3913 13.3969V4.67201L9.00007 0ZM14.8076 4.9771L9.00007 8.64809L3.19256 4.9771L9.00007 1.3061L14.8076 4.9771ZM2.70991 5.97815L8.44956 9.60619V16.4149L2.70991 12.7868V5.97815ZM9.55058 16.4149V9.60622L15.2902 5.97815V12.7868L9.55058 16.4149Z"
          fill="#DBDBDB"
        />
      </g>
      <defs>
        <clipPath id="clip0_558_4967">
          <rect width="18" height="18.069" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default Dashboard;
