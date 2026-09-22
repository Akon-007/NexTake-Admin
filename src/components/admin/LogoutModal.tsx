import { LogOut } from "lucide-react";
import { useAuth } from "../../lib/auth/context";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export default function LogoutModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { signOut, profile } = useAuth();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="End this session?"
      subtitle="You will need to sign in again to continue."
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Stay signed in
          </Button>
          <Button
            variant="danger"
            icon={<LogOut className="h-3.5 w-3.5" />}
            onClick={async () => {
              await signOut();
              onClose();
            }}
          >
            Log out
          </Button>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-muted">
        Signing out clears the verified session for{" "}
        <span className="font-semibold text-ink">{profile?.email}</span> on this
        device. Nothing you have published is affected.
      </p>
    </Modal>
  );
}
