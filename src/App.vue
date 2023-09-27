<template>
  <section class="todoapp">
    <!-- タイトル -->
    <header class="header">
      <h1>todos</h1>
      <input class="new-todo" autofocus autocomplete="off" placeholder="終わらせたいタスクを入力" v-model="newTodo"
        @keyup.enter="addTodo" />
    </header>

    <main class="main" v-show="todos.length" v-cloak>
      <!-- タイトル -->

      <input id="toggle-all" class="toggle-all" type="checkbox" v-model="allDone" />
      <label for="toggle-all"></label>


      <!-- タスク一覧 -->
      <ul class="todo-list">
        <li class="todo" v-for="todo in filteredTodos" :key="todo.id"
          :class="{ completed: todo.completed, editing: todo == editedTodo }">
          <div class="view">
            <input class="toggle" type="checkbox" v-model="todo.completed" @change="toggleCompleted(todo)" />
            <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
            <button class="destroy" @click="removeTodo(todo)"></button>
            <input class="toggle-today" type="checkbox" v-model="todo.today" v-show="!todo.completed" />
          </div>
          <input class="edit" type="text" v-model="todo.title" v-todo-focus="todo == editedTodo" @blur="doneEdit(todo)"
            @keyup.enter="doneEdit(todo)" @keyup.esc="cancelEdit(todo)" />
        </li>
      </ul>
    </main>

    <footer class="footer" v-show="todos.length" v-cloak>
      <!--
        TODO件数、フィルタボタン配置予定個所
      -->
      <div class="count">
        <span class="todo-count">未完了 {{ remaining }} 個</span>
        <span class="todo-count">本日中 {{ todaining }} 個</span>
      </div>
      <ul class="filters">
        <li>
          <a href="#/all">すべて</a>
        </li>
        <li>
          <a href="#/active">実施中</a>
        </li>
        <li>
          <a href="#/completed">完了済</a>
        </li>
        <li class="today">
          <a href="#/today">今日中</a>
        </li>
      </ul>
      <button class="clear-completed" @click="removeCompleted" v-show="todos.length > remaining">完了済みを削除する</button>
      <p class="today-button">
        <button v-show="showTodayDeleteButton">今日中を削除する</button>
        <button class="clear-completed" @click="hysteresis">rireki</button>
      </p>
    </footer>
  </section>
</template>

<script>
import todoStorage from '@/storage.js';
import filters from '@/filters.js';
import extern from '@/extern.js';


let uniq_id = 0;

export default {
  name: 'App',

  components: {
    /* 今回は未使用 */
  },

  data() {
    return {
      todos: [],
      newTodo: "",
      editedTodo: null,
      visibility: extern.visibility,
      deletedTodos: [],
    };
  },

  watch: {
    //変更された時に起動
    todos: {
      handler() {
        this.saveTodos();
      },
      deep: true // todos内部の変更も監視
    }
  },

  computed: {
    //表示している内容に変化があるとき
    filteredTodos() {
      if (this.visibility.value === 'all') {
        return filters.all(this.todos);
      } else if (this.visibility.value === 'active') {
        return filters.active(this.todos);
      } else if (this.visibility.value === 'completed') {
        return filters.completed(this.todos);
      }
      else if (this.visibility.value === 'today') {
        return filters.today(this.todos);
      }
      else {
        return this.deletedTodo(this.todos);
      }
    },

    remaining() {
      return filters.active(this.todos).length;
    },
    allDone: {
      get() {
        return this.remaining === 0;
      },
      set(value) {
        this.todos.forEach(function (todo) {
          todo.completed = value;
        });
        // データ保存
        todoStorage.save(this.todos);
      }
    },
    todaining() {
      return filters.today(this.todos).length;
    },

    showTodayDeleteButton() {
      return this.todaining > 0;
    },

  },

  mounted() {
    //ローカルストレージからデータを読み込む
    this.todos = todoStorage.fetch();
  },
  // データ処理用メソッド
  // ※ここではDOM操作しないでください。
  methods: {
    toggleCompleted(todo) {
      if (!todo.completed) {
        todo.today = false; // タスクが未完了の場合に今日中のチェックボックスを外す
        // todo.today = false; // 完了済みにすると今日中のチェックボックスを外す
      }
      this.saveTodos(); // データ保存
    },

    // データを保存するメソッド
    saveTodos() {
      todoStorage.save(this.todos);
    },

    addTodo() {
      var value = this.newTodo && this.newTodo.trim();
      if (!value) {
        return;
      }
      this.todos.push({
        id: uniq_id++,
        title: value,
        completed: false,
        today: false
      });
      this.newTodo = "";

      // 新しいタスクを追加した後にデータ保存
      this.saveTodos();
    },

    removeTodo(todo) {
      this.todos = this.todos.filter((t) => t.id !== todo.id);
    },


    editTodo(todo) {
      this.beforeEditCache = todo.title;

      this.editedTodo = todo;
    },

    doneEdit(todo) {
      if (!this.editedTodo) {
        return;
      }
      this.editedTodo = null;
      todo.title = todo.title.trim();
      if (!todo.title) {
        this.removeTodo(todo);
      }
    },

    cancelEdit(todo) {
      this.editedTodo = null;
      todo.title = this.beforeEditCache;
    },

    removeCompleted() {
      this.deletedTodos = filters.completed(this.todos);
      this.deletedTodos = [...this.deletedTodos, ...filters.completed(this.todos)];
      this.todos = filters.active(this.todos);
      // データ保存
      todoStorage.save(this.todos);
    },
    hysteresis() {
      this.visibility.value = 'hysteresis'
    },
  },
  // a custom directive to wait for the DOM to be updated
  // before focusing on the input field.
  // http://v2.vuejs.org/guide/custom-directive.html
  directives: {
    "todo-focus": (el, binding) => {
      if (binding.value) {
        el.focus();
      }
    }
  }
}

</script>
