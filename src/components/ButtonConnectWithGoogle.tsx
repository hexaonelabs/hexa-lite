import { connectWithOAuth, getMagic } from "@/servcies/magic";

type ButtonConnectWithGoogleProps = {
  isLoggedIn: boolean;
};

export const ButtonConnectWithGoogle = ({isLoggedIn}: ButtonConnectWithGoogleProps) => {
  
  return (
    <button
    disabled={isLoggedIn}
    onClick={async () => {
      try {
       await connectWithOAuth('google');
      } catch (err) {
        console.log({ err });
      }
    }}
  >
    connect with Google
  </button>
  )
};