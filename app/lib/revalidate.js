// Best-effort ISR refresh that never breaks plain-Node unit tests:
// outside the Next.js server context the dynamic import fails and the
// 60s revalidate window still backs everything up.
export async function safeRevalidate(path) {
  try {
    const { revalidatePath } = await import('next/cache');
    revalidatePath(path);
  } catch {
    // Ignore: tests and non-Next runtimes have no cache to refresh.
  }
}
