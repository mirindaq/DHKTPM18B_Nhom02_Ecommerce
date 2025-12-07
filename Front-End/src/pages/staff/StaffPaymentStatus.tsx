import { useEffect } from "react";

export default function StaffPaymentStatus() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.close();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

