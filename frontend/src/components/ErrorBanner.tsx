interface Props {
  message: string;
  onDismiss: () => void;
}

/**
 * 操作（移動・並び替えなど）の失敗を、ボードを置き換えずに表示するバナー。
 */
export default function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div className="error-banner" role="alert">
      <span className="error-banner__message">{message}</span>
      <button type="button" onClick={onDismiss}>
        閉じる
      </button>
    </div>
  );
}
