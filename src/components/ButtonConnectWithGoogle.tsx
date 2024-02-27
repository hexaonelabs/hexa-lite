
type ButtonConnectWithGoogleProps = {
  isLoggedIn: boolean;
};

export const ButtonConnectWithGoogle = ({isLoggedIn}: ButtonConnectWithGoogleProps) => {
  
  return (
    <button
    disabled={isLoggedIn}
  >
    connect with Google
  </button>
  )
};