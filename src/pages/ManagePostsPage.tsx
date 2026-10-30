import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Trash2,
  ExternalLink,
  Clock,
  RefreshCw,
  LogOut,
  FolderOpen,
  ArrowRight,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { echoService } from '@/api/echoService';
import { UserPost } from '@/api/types';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatRelativeTime, formatFullDate } from '@/utils/date';
import { echoIdentityAuth } from '@/services/echoIdentityAuth';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

export const ManagePostsPage: React.FC = () => {
  const { echoIdentity, isEchoIdentityAuthenticated, loginEchoIdentity, registerEchoIdentity, logoutEchoIdentity } =
    useAuth();
  const { copy, isCopied } = useCopyToClipboard();

  const [posts, setPosts] = useState<UserPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auth setup state for unauthenticated visitors
  const [activeTab, setActiveTab] = useState<'create' | 'login'>('create');
  const [echoboxId, setEchoboxId] = useState(() => echoIdentityAuth.generateRandomEchoBoxId());
  const [password, setPassword] = useState(() => echoIdentityAuth.generateRandomPassword());
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Deletion state
  const [postToDelete, setPostToDelete] = useState<UserPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMyPosts = useCallback(async (isManualRefresh = false) => {
    if (!isEchoIdentityAuthenticated) return;
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const myPosts = await echoService.getMyPosts();
      setPosts(myPosts);
      if (isManualRefresh) {
        toast.success(`Loaded ${myPosts.length} posts`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to retrieve your posts.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isEchoIdentityAuthenticated]);

  useEffect(() => {
    if (isEchoIdentityAuthenticated) {
      loadMyPosts();
    }
  }, [isEchoIdentityAuthenticated, loadMyPosts]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanId = echoboxId.trim();
    if (!cleanId) {
      setAuthError('Please enter a valid EchoBox ID');
      return;
    }
    if (password.length < 8) {
      setAuthError('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsAuthLoading(true);
      if (activeTab === 'create') {
        await registerEchoIdentity(cleanId, password);
      } else {
        await loginEchoIdentity(cleanId, password);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      setIsDeleting(true);
      await echoService.deleteMyPost(postToDelete.room_id, postToDelete.feedback_id);
      setPosts((prev) => prev.filter((p) => p.feedback_id !== postToDelete.feedback_id));
      toast.success('Your message was deleted successfully.');
      setPostToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete message.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyCredentials = () => {
    const text = `EchoBox ID: ${echoboxId}\nPassword: ${password}\nURL: ${window.location.origin}/my-posts`;
    copy(text, 'Credentials copied to clipboard!');
  };

  // 1. Unauthenticated View: Claim or Sign In
  if (!isEchoIdentityAuthenticated || !echoIdentity) {
    return (
      <div className="min-h-[85dvh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[360px] bg-brand-500/10 blur-3xl pointer-events-none -z-10 rounded-full"
          aria-hidden="true"
        />

        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-medium text-brand-600 dark:text-brand-400 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
              <span>Optional Post Management</span>
            </div>
            <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight">
              Manage My Posts
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Recover, review, and delete your submitted conversation messages across any device without providing an email address.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-[#121212]/95 backdrop-blur-md p-6 sm:p-8 shadow-card-light dark:shadow-card-dark space-y-6">
            {/* Tab Selector */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('create');
                  setAuthError(null);
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
                  setAuthError(null);
                  setEchoboxId('');
                  setPassword('');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Sign In with ID
              </button>
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="page-echobox-id"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    EchoBox ID
                  </label>
                  {activeTab === 'create' && (
                    <button
                      type="button"
                      onClick={() => {
                        setEchoboxId(echoIdentityAuth.generateRandomEchoBoxId());
                        setPassword(echoIdentityAuth.generateRandomPassword());
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-brand-500 hover:underline"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Re-roll</span>
                    </button>
                  )}
                </div>
                <input
                  id="page-echobox-id"
                  type="text"
                  required
                  value={echoboxId}
                  onChange={(e) => setEchoboxId(e.target.value)}
                  placeholder="e.g. echo_7K29XQ"
                  className="w-full h-11 px-4 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/80 font-mono text-sm focus-visible:outline-2 focus-visible:outline-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="page-echobox-pwd"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Password
                  </label>
                  <span className="text-[11px] text-neutral-400">Min 8 characters</span>
                </div>
                <div className="relative">
                  <input
                    id="page-echobox-pwd"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-4 pr-11 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/80 font-mono text-sm focus-visible:outline-2 focus-visible:outline-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {activeTab === 'create' && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-neutral-300 dark:border-white/15 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5"
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

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 font-semibold shadow-glow"
                isLoading={isAuthLoading}
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                {activeTab === 'create' ? 'Activate EchoBox ID' : 'Sign In to My Posts'}
              </Button>
            </form>

            <div className="pt-2 text-center text-xs text-neutral-500">
              <Link to="/" className="text-brand-500 hover:underline">
                ← Return to EchoBox Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Dashboard View: Manage Posts
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 min-h-[85dvh]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-brand-500 uppercase tracking-wider">
              EchoBox Identity
            </span>
            <span className="text-neutral-400">•</span>
            <span className="font-mono text-xs text-neutral-500">
              {echoIdentity.echoboxId}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight mt-1">
            My Submitted Posts
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Review and delete conversation messages you have posted under this EchoBox ID.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadMyPosts(true)}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={logoutEchoIdentity}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Disconnect ID
          </Button>
        </div>
      </div>

      {/* Posts List / Empty State */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/40 dark:bg-white/5 animate-pulse p-5"
            />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => {
            const nowSec = Math.floor(Date.now() / 1000);
            const remainingSec = Math.max(0, post.expires_at - nowSec);
            const hoursRem = Math.floor(remainingSec / 3600);
            const minsRem = Math.floor((remainingSec % 3600) / 60);

            return (
              <div
                key={post.feedback_id}
                className="group relative rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white dark:bg-[#121212] p-5 sm:p-6 shadow-sm hover:shadow-card-light dark:hover:shadow-card-dark transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/room/${post.room_id}`}
                        className="font-bold text-neutral-900 dark:text-white font-display hover:text-brand-500 transition-colors flex items-center gap-1.5"
                      >
                        <span>{post.room_name}</span>
                        <ExternalLink className="w-3 h-3 text-neutral-400" />
                      </Link>
                      <span className="font-mono text-[11px] bg-neutral-100 dark:bg-white/5 px-2 py-0.5 rounded text-neutral-400">
                        #{post.room_id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      <span>Posted as: <strong className="text-neutral-700 dark:text-neutral-300">{post.display_name}</strong></span>
                      <span>•</span>
                      <span title={formatFullDate(post.created_at)}>
                        {formatRelativeTime(post.created_at)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-500 font-mono">
                        <Clock className="w-3 h-3" />
                        {hoursRem}h {minsRem}m remaining
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPostToDelete(post)}
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                    className="border-rose-500/20 text-rose-500 hover:bg-rose-500/10 flex-shrink-0 text-xs"
                  >
                    Delete Message
                  </Button>
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-white/5">
                  <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap break-words leading-relaxed">
                    {post.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-white/10 bg-white/40 dark:bg-white/5 space-y-4">
          <FolderOpen className="w-10 h-10 text-neutral-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              No Posts Found Under This ID
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
              When you send messages while connected to this EchoBox ID, they will appear here so you can review or delete them anytime.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link to="/">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Explore Public Rooms
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleDeletePost}
        title="Delete Your Message?"
        message="Are you sure you want to permanently delete this message from the conversation? This action cannot be undone."
        confirmLabel="Delete Message"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
