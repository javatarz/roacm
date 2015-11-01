class Path {
  private final int node;
  private boolean traversed;

  Path(final int node) {
    this.node = node;
    this.traversed = false;
  }

  Path(final Path path) {
    this.node = path.getNode();
    this.traversed = path.isTraversed();
  }

  public int getNode() {
    return this.node;
  }

  public boolean isTraversed() {
    return this.traversed;
  }

  public void performTraversal() {
    this.traversed = true;
  }

  @Override
  public String toString() {
    return String.valueOf(this.node);
  }
}
