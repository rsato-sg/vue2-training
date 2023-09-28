/**
 * ストレージに入出力オブジェクト
 */

// ローカルストレージに保存するためのキー
const STORAGE_KEY = "todos-vuejs-2.0";
const DELETED_STORAGE_KEY = "deleted-todos"; // 新しいキーを追加

const storage = {
  uid: 0,
  fetch() {
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
   // const deletedTodos = JSON.parse(localStorage.getItem(DELETED_STORAGE_KEY) || "[]");
    todos.forEach((todo, index) => {
      todo.id = index;
    });
    this.uid = todos.length;
    return todos;
  },
  save(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  },
  deletedSave(deletedTodos) { // メソッドの引数を deletedTodos に変更
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deletedTodos)); // 新しいキーを使用
  }
}

export default storage;