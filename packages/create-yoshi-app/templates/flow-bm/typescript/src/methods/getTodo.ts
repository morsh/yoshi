export default function getTodo(this: any, id: string) {
  return this.state.todos[id];
}
