import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AUTH_PATH } from "@/constants/path";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    onOpenChange(false);
    navigate(AUTH_PATH.LOGIN_USER);
  };

  const handleRegisterClick = () => {
    onOpenChange(false);
    navigate(AUTH_PATH.REGISTER_USER);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-[#AC0014] text-xl font-bold">
            SMember
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="text-center">
            {/* Smember Icon */}
            <div className="mb-4">
              <div className="w-24 h-24 mx-auto flex items-center justify-center text-white">
                <img src="/assets/bee.png" alt="Smember" />
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Vui lòng đăng nhập tài khoản Smember để xem ưu đãi và thanh toán dễ dàng hơn.
            </p>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleRegisterClick}
            className="w-full sm:w-auto border-[#AC0014] text-[#AC0014] hover:bg-[#AC0014] hover:text-white"
          >
            Đăng ký
          </Button>
          <Button
            onClick={handleLoginClick}
            className="w-full sm:w-auto bg-[#AC0014] hover:bg-red-700"
          >
            Đăng nhập
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
