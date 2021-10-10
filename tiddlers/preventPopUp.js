exports.startup = function () {
  setTimeout(() => {
    $tw.unloadTasks = $tw.unloadTasks.filter((task) => !task.toString().includes('confirmationMessage'));
  }, 100);
};
