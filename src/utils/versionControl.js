export function createVersionControl(workflowName) {
  const storageKey = `workflow_versions_${workflowName}`;

  return {
    saveVersion(nodes, edges, label = "") {
      const versions = this.listVersions();
      const version = {
        id: `v_${Date.now()}`,
        timestamp: Date.now(),
        label: label || `Snapshot ${versions.length + 1}`,
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      };
      versions.push(version);
      localStorage.setItem(storageKey, JSON.stringify(versions));
      return version;
    },

    listVersions() {
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : [];
    },

    getVersion(versionId) {
      const versions = this.listVersions();
      return versions.find((v) => v.id === versionId);
    },

    deleteVersion(versionId) {
      const versions = this.listVersions();
      const filtered = versions.filter((v) => v.id !== versionId);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    },

    updateLabel(versionId, newLabel) {
      const versions = this.listVersions();
      const version = versions.find((v) => v.id === versionId);
      if (version) {
        version.label = newLabel;
        localStorage.setItem(storageKey, JSON.stringify(versions));
      }
    },

    clear() {
      localStorage.removeItem(storageKey);
    },
  };
}