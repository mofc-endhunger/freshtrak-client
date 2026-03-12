import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "../../lib/utils";

function Separator(
	{
		className,
		orientation = "horizontal",
		decorative = true,
		...props
	}: React.ComponentProps<typeof SeparatorPrimitive.Root>,
	ref: React.Ref<React.ElementRef<typeof SeparatorPrimitive.Root>>
) {
	return (
		<SeparatorPrimitive.Root
			ref={ref}
			data-slot="separator"
			decorative={decorative}
			orientation={orientation}
			className={cn(
				"bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
				className
			)}
			{...props}
		/>
	);
}

const SeparatorComponent = React.forwardRef(Separator);

export { Separator };
