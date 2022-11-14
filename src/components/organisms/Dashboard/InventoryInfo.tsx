export interface InventoryInfoData {
  nodesCount: number;
  podsCount: number;
  podsCapacity: number;
}

export const InventoryInfo = ({inventoryData}: {inventoryData: InventoryInfoData}) => {
  return (
    <div>
      <div>{inventoryData.nodesCount} Nodes</div>
      <div>TOTAL / {inventoryData.podsCapacity} Pods</div>
    </div>
  );
};
