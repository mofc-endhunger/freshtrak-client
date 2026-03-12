import * as React from "react";

import { cn } from "../../lib/utils";

function Card(
	{ className, ...props }: React.ComponentProps<"div">,
	ref: React.Ref<HTMLDivElement>
) {
	return (
		<div
			ref={ref}
			data-slot="card"
			className={cn(
				"bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
				className
			)}
			{...props}
		/>
	);
}

const CardComponent = React.forwardRef(Card);

function CardHeader(
	{ className, ...props }: React.ComponentProps<"div">,
	ref: React.Ref<HTMLDivElement>
) {
	return (
		<div
			ref={ref}
			data-slot="card-header"
			className={cn(
				"@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
				className
			)}
			{...props}
		/>
	);
}

const CardHeaderComponent = React.forwardRef(CardHeader);

function CardTitle(
	{ className, ...props }: React.ComponentProps<"div">,
	ref: React.Ref<HTMLDivElement>
) {
	return (
		<div
			ref={ref}
			data-slot="card-title"
			className={cn("leading-none font-semibold", className)}
			{...props}
		/>
	);
}

const CardTitleComponent = React.forwardRef(CardTitle);

function CardDescription(
	{ className, ...props }: React.ComponentProps<"div">,
	ref: React.Ref<HTMLDivElement>
) {
	return (
		<div
			ref={ref}
			data-slot="card-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

const CardDescriptionComponent = React.forwardRef(CardDescription);

function CardAction(
	{ className, ...props }: React.ComponentProps<"div">,
	ref: React.Ref<HTMLDivElement>
) {
	return (
		<div
			ref={ref}
			data-slot="card-action"
			className={cn(
				"col-start-2 row-span-2 row-start-1 self-start justify-self-end",
				className
			)}
			{...props}
		/>
	);
}

const CardActionComponent = React.forwardRef(CardAction);

function CardContent(
	{ className, ...props }: React.ComponentProps<"div">,
	ref: React.Ref<HTMLDivElement>
) {
	return (
		<div
			ref={ref}
			data-slot="card-content"
			className={cn("px-6", className)}
			{...props}
		/>
	);
}

const CardContentComponent = React.forwardRef(CardContent);

function CardFooter(
	{ className, ...props }: React.ComponentProps<"div">,
	ref: React.Ref<HTMLDivElement>
) {
	return (
		<div
			ref={ref}
			data-slot="card-footer"
			className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
			{...props}
		/>
	);
}

const CardFooterComponent = React.forwardRef(CardFooter);

export {
	CardComponent as Card,
	CardHeaderComponent as CardHeader,
	CardFooterComponent as CardFooter,
	CardTitleComponent as CardTitle,
	CardActionComponent as CardAction,
	CardDescriptionComponent as CardDescription,
	CardContentComponent as CardContent,
};
