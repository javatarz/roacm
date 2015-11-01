public class PasscodeGenerator {

    // Data structures
    private static final Set<Integer> digitUniverse = new HashSet<>();
    private static final Map<Integer, List<Path>> masterConnections = new HashMap<>();
    private static final Map<Integer, List<Path>> connections = new HashMap<>();

    // Lamdas
    private static final Function<String, IntStream> digitSeparator = str -> str.chars().map(c -> Integer.valueOf(String.valueOf((char) c)));
    private static final IntConsumer addToDigitUniverse = i -> digitUniverse.add(i);
    private static final IntConsumer updateConnections = digit -> {
        connections.forEach((key, values) -> values.add(new Path(digit)));

        final List<Path> set = connections.get(digit);
        if (set == null) {
            connections.put(digit, new ArrayList<>());
        }
    };
    private static final Consumer<Map.Entry<Integer, List<Path>>> connectionMerge = entry -> {
        final Integer key = entry.getKey();
        final List<Path> contenderValues = entry.getValue();
        List<Path> targetValues = masterConnections.get(key);

        if (targetValues == null) {
            targetValues = new ArrayList<>();
            masterConnections.put(key, targetValues);
        }

        targetValues.addAll(contenderValues);
    };
    private static final Consumer<String> passcodeConsumer = passcode -> {
        digitSeparator.apply(passcode).forEach(addToDigitUniverse);
        digitSeparator.apply(passcode).forEach(updateConnections);

        connections.entrySet().forEach(connectionMerge);
        connections.clear();
    };

    public static void main(String[] args) throws IOException {
        // final List<String> passcodes =
        // Files.readAllLines(Paths.get("./keylog.txt"));
        final List<String> passcodes = Arrays.asList(new String[] { "123", "325" });

        passcodes.forEach(passcodeConsumer);

        System.out.println("Final Master Connections: " + masterConnections);

        masterConnections.forEach((k, v) -> {
            final String possibleSolution = findPossibleSolution(deepCloneMap(masterConnections), new ArrayList<>(), new Path(k));
            if (possibleSolution.length() > 0) {
                System.out.println("Possible Solution: " + possibleSolution + " (Vertex: " + k + ")");
            }
        });
    }

    private static String findPossibleSolution(final Map<Integer, List<Path>> connections, final List<Path> parentNodes, final Path currentNode) {
        final List<Path> childNodes = masterConnections.get(currentNode.getNode());
        parentNodes.add(currentNode);
        currentNode.performTraversal();

        if (childNodes.isEmpty()) {
            final String candidate = parentNodes.stream().map(i -> i.toString()).collect(Collectors.joining());
            final boolean valid = digitUniverse.stream().allMatch(i -> candidate.contains(String.valueOf(i)));
            return valid ? candidate : "";
        }

        return childNodes.stream().filter(node -> !node.isTraversed()).map(node -> findPossibleSolution(connections, deepCloneList(parentNodes), node))
                .reduce("", (a, b) -> (a.length() > b.length() ? a : b));
    }

    private static Map<Integer, List<Path>> deepCloneMap(final Map<Integer, List<Path>> original) {
        final Map<Integer, List<Path>> copy = new HashMap<Integer, List<Path>>();

        original.forEach((k, v) -> copy.put(k, deepCloneList(v)));
        return copy;
    }

    private static List<Path> deepCloneList(final List<Path> original) {
        final List<Path> copy = new ArrayList<>();
        for (final Path path : original) {
            copy.add(new Path(path));
        }
        return copy;
    }
}
