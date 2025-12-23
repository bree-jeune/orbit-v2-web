<script src="https://unpkg.com/iframe-console-relay/dist/index.umd.min.js">
  // Create a new console instance
    
    const console = new IFrameConsoleRelay({
    iframe: document.getElementById('iframe'),
    logLevel: 'debug';
    // Add a listener for when the console is ready
    onReady: () => {
      // Log a message to the console
      console.log('Hello, world!');
    },
    onError: (error) => {
      // Log an error to the console
      console.error('An error occurred:', error);
    },
  });
</script>

