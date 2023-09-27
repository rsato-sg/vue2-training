/**
 * データフィルタ用オブジェクト
 */

const filters = {
  all(todos) {
    return todos;
  },
  active(todos) {
    return todos.filter((todo) => !todo.completed);
  },
  completed(todos) {
    return todos.filter((todo) => todo.completed);
  },
  today(todos) {
    return todos.filter((todo) => !todo.completed && todo.today);
  }
};

export default filters;