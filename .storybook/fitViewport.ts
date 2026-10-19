/** Keep device presets visible without changing the viewport inside the iframe. */
export const fitViewport = () => {
  let wrapper: HTMLElement | null = null;
  let frame: HTMLIFrameElement | null = null;
  let pending = false;

  const fit = () => {
    pending = false;
    if (!wrapper || !frame) {
      return;
    }

    // The viewport addon switches to a grid with a relatively positioned iframe.
    const styles = getComputedStyle(wrapper);
    const devicePreset = styles.display === 'grid' && getComputedStyle(frame).position === 'relative';
    if (!devicePreset) {
      frame.style.removeProperty('scale');
      frame.style.removeProperty('transform-origin');
      frame.style.removeProperty('align-self');
      wrapper.style.removeProperty('overflow');
      return;
    }

    const width = wrapper.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
    const height = wrapper.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
    if (width <= 0 || height <= 0 || !frame.offsetWidth || !frame.offsetHeight) {
      return;
    }

    const scale = Math.min(1, width / frame.offsetWidth, height / frame.offsetHeight);
    frame.style.setProperty('scale', String(scale));
    frame.style.setProperty('transform-origin', 'top center');
    frame.style.setProperty('align-self', 'start');
    wrapper.style.setProperty('overflow', 'hidden');
  };

  const schedule = () => {
    if (!pending) {
      pending = true;
      requestAnimationFrame(fit);
    }
  };
  const resize = new ResizeObserver(schedule);
  const connect = () => {
    const nextWrapper = document.getElementById('storybook-preview-wrapper');
    const nextFrame = document.querySelector<HTMLIFrameElement>('#storybook-preview-iframe');
    if (nextWrapper === wrapper && nextFrame === frame) {
      return;
    }

    resize.disconnect();
    wrapper = nextWrapper;
    frame = nextFrame;
    if (wrapper && frame) {
      resize.observe(wrapper);
      resize.observe(frame, { box: 'border-box' });
      schedule();
    }
  };

  new MutationObserver(connect).observe(document.body, { childList: true, subtree: true });
  connect();
};
