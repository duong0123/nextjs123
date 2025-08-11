
import LoginForm from "../ui/login-form";
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Login',
};

export default function Page() {
  return( <>
  <LoginForm></LoginForm>
  </>)

  ;
}