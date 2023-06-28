export function startExecutionTimer() {
  const startTime = new Date().getTime();

  /**
   * Returns the time elapsed since the timer was started
   */
  return () => {
    const endTime = new Date().getTime();
    const executionTime = endTime - startTime;
    return executionTime;
  };
}
