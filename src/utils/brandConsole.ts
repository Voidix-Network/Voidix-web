export const logBrandMessage = () => {
  const brandArt = `
 __     __    _     _ _
 \\ \\   / /__ (_) __| (_)_  __
  \\ \\ / / _ \\| |/ _\` | \\ \\/ /
   \\ V / (_) | | (_| | |>  <
    \\_/ \\___/|_|\\__,_|_/_/\\_\\
`;

  const styles = [
    'font-family: "Courier New", Courier, monospace',
    'font-weight: bold',
    'font-size: 10px',
    'line-height: 0.8',
    'background: linear-gradient(90deg, rgb(106, 147, 255), rgb(115, 103, 240))',
    'color: transparent',
    '-webkit-background-clip: text',
    'background-clip: text',
    'padding: 2px',
  ].join(';');

  const message = '如果你不是开发者，请不要在此粘贴任何代码';
  const messageStyles = ['font-family: sans-serif', 'font-size: 25px', 'color: #a5b4fc'].join(';');

  console.log(`%c${brandArt}`, styles);
  console.log(`%c${message}`, messageStyles);
};
