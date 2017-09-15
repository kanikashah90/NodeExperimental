// Note: This file only works on node v8.5.x
// To run basic demo call basicPerformanceMarksAndMeasureExample() at the end.
// To measure async operation duration call measureAsyncOpDuration() at the end.

const {performance, PerformanceObserver} = require('perf_hooks'),
  aysnc_hooks = require('async_hooks');

function doSomeLongRunningProcess(cb) {
  const fibValue = doFibonacci(20);
  cb();
};

function doFibonacci(input) {
  if (input == 1 || input == 2) return input;
  return doFibonacci(input - 1) + doFibonacci(input - 2);
}

function basicPerformanceMarksAndMeasureExample() {
  performance.mark('A');
  doSomeLongRunningProcess(() => {
    performance.mark('B');
    performance.measure('A to B', 'A', 'B');
    const measure = performance.getEntriesByName('A to B')[0];
    console.log(measure.duration + ' ms');
    performance.clearMarks();
    performance.clearMeasures();
  });
}

function measureAsyncOpDuration() {
  const set = new Set();
  const hook = aysnc_hooks.createHook({
    init(id, type) {
      if (type === 'Timeout') {
        performance.mark(`Timeout-${id}-Init`);
        set.add(id);
      }
    },
    destroy(id) {
      if (set.has(id)) {
        set.delete(id);
        performance.mark(`Timeout-${id}-Destroy`);
        performance.measure(`Timeout-${id}`,
                            `Timeout-${id}-Init`,
                            `Timeout-${id}-Destroy`);
      }
    }
  });
  hook.enable();

  const obs = new PerformanceObserver((list, observer) => {
    console.log(list.getEntries()[0]);
    performance.clearMarks();
    performance.clearMeasures();
    observer.disconnect();
  });
  obs.observe({entryTypes: ['measure'], buffered: true});

  setTimeout(() => {}, 1000);
}