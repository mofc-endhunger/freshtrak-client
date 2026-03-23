/**
 * ViewToggle Component
 * Allows users to switch between grid view and map+list hybrid view for event cards
 */
import React from "react";
import { LayoutGrid, Map } from "lucide-react";
import { Button } from "../../components/ui/button";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({
	viewMode,
	onViewModeChange,
}) => {
	return (
		<div className="flex items-center space-x-1">
			<Button
				onClick={() => onViewModeChange("grid")}
				variant={viewMode === "grid" ? "default" : "outline"}
				size="sm"
				className="h-8 w-8 p-0"
				aria-label="Grid view"
				aria-pressed={viewMode === "grid"}
			>
				<LayoutGrid className="w-4 h-4" />
			</Button>
			<Button
				onClick={() => onViewModeChange("list")}
				variant={viewMode === "list" ? "default" : "outline"}
				size="sm"
				className="h-8 w-8 p-0"
				aria-label="Map with list view"
				aria-pressed={viewMode === "list"}
			>
				<Map className="w-4 h-4" />
			</Button>
		</div>
	);
};

export default ViewToggle;
