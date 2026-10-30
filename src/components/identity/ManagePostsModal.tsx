import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  LogOut,
  FolderOpen,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { echoIdentityAuth } from '@/services/echoIdentityAuth';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface ManagePostsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManagePostsModal: React.FC<ManagePostsModalProps> = ({ isOpen, onClose }) => {
  const { echoIdentity, isEchoIdentityAuthenticated, loginEchoIdentity, registerEchoIdentity, logoutEchoIdentity } =
    useAuth();
  const navigate = useNavigate();
  const { copy, isCopied } = useCopyToClipboard();

  const [activeTab, setActiveTab] = useState<'create' | 'login'>('create');
  const [echoboxId, setEchoboxId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize random suggested credentials whenever modal opens
  useEffect(() => {
    if (isOpen && !isEchoIdentityAuthenticated) {
      setEchoboxId(echoIdentityAuth.generateRandomEchoBoxId());
      setPassword(echoIdentityAuth.generateRandomPassword());
      setErrorMsg(null);
    }
  }, [isOpen, isEchoIdentityAuthenticated]);

  const handleRegenerate = () => {
    setEchoboxId(echoIdentityAuth.generateRandomEchoBoxId());
    setPassword(echoIdentityAuth.generateRandomPassword());
    setErrorMsg(null);
  };

  const handleCopyCredentials = () => {
    const text = `EchoBox ID: ${echoboxId}\nPassword: ${password}\nSign-in URL: ${window.location.origin}/my-posts`;
    copy(text, 'EchoBox credentials copied to clipboard!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanId = echoboxId.trim();
    if (!cleanId) {
      setErrorMsg('Please enter a valid EchoBox ID');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);
      if (activeTab === 'create') {
        await registerEchoIdentity(cleanId, password);
      } else {
        await loginEchoIdentity(cleanId, password);
      }
      onClose();
      navigate('/my-posts');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage My Posts"
      description="Optional credentials to manage and recover your posts across devices without providing an email address."
    >
      {isEchoIdentityAuthenticated && echoIdentity ? (
        <div className="space-y-5 pt-2">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Connected EchoBox Identity</span>
            </div>
            <p className="font-mono text-base font-bold text-neutral-900 dark:text-white">
              {echoIdentity.echoboxId}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Messages you post while active in this session are associated with this identity, allowing you to delete or review them.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                logoutEchoIdentity();
              }}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Disconnect
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                navigate('/my-posts');
              }}
              rightIcon={<FolderOpen className="w-3.5 h-3.5 ml-1" />}
            >
              Open Posts Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('create');
                setErrorMsg(null);
                setEchoboxId(echoIdentityAuth.generateRandomEchoBoxId());
                setPassword(echoIdentityAuth.generateRandomPassword());
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'create'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Claim EchoBox ID
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
                setEchoboxId('');
                setPassword('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              I Have an ID
            </button>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-700 dark:text-brand-300 leading-relaxed">
            <strong className="font-semibold">Zero personal data:</strong> No email, real name, or phone number required. Save your ID and password securely so you can access your post history from any browser.
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* EchoBox ID Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="echobox-id"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  EchoBox ID
                </label>
                {activeTab === 'create' && (
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="inline-flex items-center gap-1 text-[11px] text-brand-500 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-roll</span>
                  </button>
                )}
              </div>
              <input
                id="echobox-id"
                type="text"
                required
                value={echoboxId}
                onChange={(e) => setEchoboxId(e.target.value)}
                placeholder="e.g. echo_7K29XQ"
                className="w-full h-10 px-3.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/80 font-mono text-sm focus-visible:outline-2 focus-visible:outline-brand-500"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="echobox-pwd"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Password
                </label>
                <span className="text-[11px] text-neutral-400">Min 8 characters</span>
              </div>
              <div className="relative">
                <input
                  id="echobox-pwd"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/80 font-mono text-sm focus-visible:outline-2 focus-visible:outline-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Copy Credentials Quick Action (Create tab) */}
            {activeTab === 'create' && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-neutral-300 dark:border-white/15 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Credentials Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ID & Password to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-white/5">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                {activeTab === 'create' ? 'Activate EchoBox ID' : 'Sign In to Posts'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};
