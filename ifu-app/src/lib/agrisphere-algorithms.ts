export type TfIdfDocument = {
  id: string;
  tokens: string[];
};

export type TfIdfModel = {
  terms: string[];
  idf: number[];
  documentCount: number;
};

export function tokenizeAgriSphereText(text: string) {
  return text.toLocaleLowerCase("en").match(/[\p{L}\p{N}]+/gu) ?? [];
}

export class TfIdfVectorizer {
  private terms: string[] = [];
  private termIndexes = new Map<string, number>();
  private idf: number[] = [];
  private documentCount = 0;

  fit(documents: TfIdfDocument[]) {
    this.documentCount = documents.length;
    const documentFrequency = new Map<string, number>();

    documents.forEach((document) => {
      new Set(document.tokens).forEach((term) => {
        documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
      });
    });

    this.terms = [...documentFrequency.keys()].sort((a, b) => a.localeCompare(b));
    this.termIndexes = new Map(this.terms.map((term, index) => [term, index]));
    this.idf = this.terms.map((term) => {
      const frequency = documentFrequency.get(term) ?? 0;
      return Math.log((this.documentCount + 1) / (frequency + 1)) + 1;
    });
  }

  importModel(model: TfIdfModel) {
    if (
      model.terms.length !== model.idf.length ||
      model.documentCount < 0 ||
      model.idf.some((value) => !Number.isFinite(value))
    ) {
      throw new Error("TfIdfVectorizer.importModel received an invalid model.");
    }

    this.terms = [...model.terms];
    this.termIndexes = new Map(this.terms.map((term, index) => [term, index]));
    this.idf = [...model.idf];
    this.documentCount = model.documentCount;
  }

  exportModel(): TfIdfModel {
    return {
      terms: [...this.terms],
      idf: [...this.idf],
      documentCount: this.documentCount,
    };
  }

  transform(tokens: string[]) {
    const vector = new Array(this.terms.length).fill(0);

    if (tokens.length === 0) {
      return vector;
    }

    const termFrequency = new Map<string, number>();

    tokens.forEach((token) => {
      termFrequency.set(token, (termFrequency.get(token) ?? 0) + 1);
    });

    termFrequency.forEach((count, term) => {
      const index = this.termIndexes.get(term);

      if (index !== undefined) {
        vector[index] = (count / tokens.length) * this.idf[index];
      }
    });

    return vector;
  }

  get dimensions() {
    return this.terms.length;
  }
}

export function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length) {
    throw new Error(`cosineSimilarity vector length mismatch: ${a.length} versus ${b.length}.`);
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < a.length; index += 1) {
    dotProduct += a[index] * b[index];
    magnitudeA += a[index] ** 2;
    magnitudeB += b[index] ** 2;
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function numericSeed(seed: string | number) {
  if (typeof seed === "number") {
    return seed >>> 0;
  }

  let value = 2166136261;

  for (const character of seed) {
    value ^= character.codePointAt(0) ?? 0;
    value = Math.imul(value, 16777619);
  }

  return value >>> 0;
}

function seededRandom(seed: string | number) {
  let state = numericSeed(seed) || 0x9e3779b9;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4_294_967_296;
  };
}

function squaredDistance(a: number[], b: number[]) {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} versus ${b.length}.`);
  }

  return a.reduce((total, value, index) => total + (value - b[index]) ** 2, 0);
}

export type KMeansResult = {
  centroids: number[][];
  assignments: number[];
  iterations: number;
};

export class KMeans {
  private readonly random: () => number;

  constructor(
    private readonly k: number,
    private readonly maxIterations = 100,
    private readonly tolerance = 1e-4,
    seed: string | number = "ifu-agrisphere-kmeans-v1",
  ) {
    if (!Number.isInteger(k) || k < 1) {
      throw new Error("KMeans k must be a positive integer.");
    }

    this.random = seededRandom(seed);
  }

  fit(vectors: number[][]): KMeansResult {
    if (vectors.length < this.k) {
      throw new Error(`KMeans needs at least ${this.k} vectors; received ${vectors.length}.`);
    }

    const dimensions = vectors[0]?.length ?? 0;

    if (
      dimensions === 0 ||
      vectors.some(
        (vector) =>
          vector.length !== dimensions || vector.some((value) => !Number.isFinite(value)),
      )
    ) {
      throw new Error("KMeans vectors must be finite, non-empty, and equal in length.");
    }

    let centroids = this.initializeCentroids(vectors);
    let assignments = new Array(vectors.length).fill(-1);
    let iterations = 0;

    for (; iterations < this.maxIterations; iterations += 1) {
      const nextAssignments = vectors.map((vector) => this.predict(vector, centroids));
      const sums = Array.from({ length: this.k }, () => new Array(dimensions).fill(0));
      const counts = new Array(this.k).fill(0);

      vectors.forEach((vector, vectorIndex) => {
        const cluster = nextAssignments[vectorIndex];
        counts[cluster] += 1;
        vector.forEach((value, dimension) => {
          sums[cluster][dimension] += value;
        });
      });

      const nextCentroids = sums.map((sum, cluster) =>
        counts[cluster] === 0
          ? centroids[cluster]
          : sum.map((total) => total / counts[cluster]),
      );
      const shift = centroids.reduce(
        (total, centroid, index) =>
          total + Math.sqrt(squaredDistance(centroid, nextCentroids[index])),
        0,
      );

      centroids = nextCentroids;
      assignments = nextAssignments;

      if (shift < this.tolerance) {
        iterations += 1;
        break;
      }
    }

    return { centroids, assignments, iterations };
  }

  predict(vector: number[], centroids: number[][]) {
    if (centroids.length === 0) {
      throw new Error("KMeans.predict requires at least one centroid.");
    }

    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    centroids.forEach((centroid, index) => {
      const distance = squaredDistance(vector, centroid);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  private initializeCentroids(vectors: number[][]) {
    const centroids = [[...vectors[Math.floor(this.random() * vectors.length)]]];

    while (centroids.length < this.k) {
      const distances = vectors.map((vector) =>
        Math.min(...centroids.map((centroid) => squaredDistance(vector, centroid))),
      );
      const totalDistance = distances.reduce((total, distance) => total + distance, 0);

      if (totalDistance === 0) {
        centroids.push([...vectors[centroids.length % vectors.length]]);
        continue;
      }

      let threshold = this.random() * totalDistance;
      let chosenIndex = distances.length - 1;

      for (let index = 0; index < distances.length; index += 1) {
        threshold -= distances[index];

        if (threshold <= 0) {
          chosenIndex = index;
          break;
        }
      }

      centroids.push([...vectors[chosenIndex]]);
    }

    return centroids;
  }
}

type IsolationTreeNode = {
  isLeaf: boolean;
  size: number;
  splitFeature?: number;
  splitValue?: number;
  left?: IsolationTreeNode;
  right?: IsolationTreeNode;
};

const EULER_MASCHERONI = 0.5772156649;

export class IsolationForest {
  private trees: IsolationTreeNode[] = [];
  private fittedSampleSize = 0;
  private readonly random: () => number;

  constructor(
    private readonly treeCount = 100,
    private readonly sampleSize = 256,
    seed: string | number = "ifu-agrisphere-isolation-v1",
  ) {
    if (treeCount < 1 || sampleSize < 2) {
      throw new Error("IsolationForest requires at least one tree and a sample size of two.");
    }

    this.random = seededRandom(seed);
  }

  fit(data: number[][]) {
    if (data.length < 2) {
      throw new Error("IsolationForest.fit requires at least two observations.");
    }

    const dimensions = data[0].length;

    if (
      dimensions === 0 ||
      data.some(
        (row) => row.length !== dimensions || row.some((value) => !Number.isFinite(value)),
      )
    ) {
      throw new Error("IsolationForest observations must be finite, non-empty, and equal in length.");
    }

    this.fittedSampleSize = Math.min(this.sampleSize, data.length);
    const heightLimit = Math.ceil(Math.log2(this.fittedSampleSize));
    this.trees = Array.from({ length: this.treeCount }, () =>
      this.buildTree(this.subsample(data, this.fittedSampleSize), 0, heightLimit),
    );
  }

  anomalyScore(point: number[]) {
    if (this.trees.length === 0) {
      throw new Error("IsolationForest.anomalyScore requires a fitted model.");
    }

    const averagePathLength =
      this.trees.reduce((total, tree) => total + this.pathLength(point, tree, 0), 0) /
      this.trees.length;
    const normalization = this.averagePathLengthCorrection(this.fittedSampleSize);

    return normalization === 0 ? 0 : 2 ** (-averagePathLength / normalization);
  }

  isAnomalous(point: number[], threshold = 0.65) {
    return this.anomalyScore(point) >= threshold;
  }

  private subsample(data: number[][], size: number) {
    const shuffled = [...data];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(this.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled.slice(0, size);
  }

  private buildTree(data: number[][], depth: number, heightLimit: number): IsolationTreeNode {
    if (depth >= heightLimit || data.length <= 1) {
      return { isLeaf: true, size: data.length };
    }

    const variableFeatures = data[0]
      .map((_, feature) => {
        const values = data.map((row) => row[feature]);
        return { feature, min: Math.min(...values), max: Math.max(...values) };
      })
      .filter(({ min, max }) => min < max);

    if (variableFeatures.length === 0) {
      return { isLeaf: true, size: data.length };
    }

    const selection = variableFeatures[Math.floor(this.random() * variableFeatures.length)];
    const splitValue = selection.min + this.random() * (selection.max - selection.min);
    const left = data.filter((row) => row[selection.feature] < splitValue);
    const right = data.filter((row) => row[selection.feature] >= splitValue);

    return {
      isLeaf: false,
      size: data.length,
      splitFeature: selection.feature,
      splitValue,
      left: this.buildTree(left, depth + 1, heightLimit),
      right: this.buildTree(right, depth + 1, heightLimit),
    };
  }

  private pathLength(point: number[], node: IsolationTreeNode, depth: number): number {
    if (node.isLeaf) {
      return depth + this.averagePathLengthCorrection(node.size);
    }

    return point[node.splitFeature ?? 0] < (node.splitValue ?? 0)
      ? this.pathLength(point, node.left!, depth + 1)
      : this.pathLength(point, node.right!, depth + 1);
  }

  private averagePathLengthCorrection(size: number) {
    if (size <= 1) {
      return 0;
    }

    if (size === 2) {
      return 1;
    }

    return 2 * (Math.log(size - 1) + EULER_MASCHERONI) - (2 * (size - 1)) / size;
  }
}

export function haversineDistanceKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const earthRadiusKm = 6_371;
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(latitudeB - latitudeA);
  const longitudeDelta = radians(longitudeB - longitudeA);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latitudeA)) *
      Math.cos(radians(latitudeB)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}
