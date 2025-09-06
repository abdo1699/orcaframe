"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const chartVariants = cva("", {
  variants: {
    variant: {
      default: "text-foreground",
      muted: "text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const chartLabelVariants = cva("", {
  variants: {
    variant: {
      default: "fill-foreground",
      muted: "fill-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const chartLegendVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// ChartConfig type definition

export interface ChartContextValue {
  config: any
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: any
    children: React.ComponentProps<"div">["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        id={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs", 
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    children: React.ComponentProps<"div">["children"]
  }
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-center gap-1.5 rounded-md border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }
>(({ 
  className, 
  hideLabel, 
  hideIndicator, 
  indicator = "dot", 
  nameKey, 
  labelKey,
  ...props 
}, ref) => {
  const { config } = useChart()

  return (
    <div
      ref={ref}
      className={cn("grid gap-1.5", className)}
      {...props}
    >
      {!hideLabel && (
        <div className="grid gap-1.5">
          <div className="flex items-center gap-2">
            {!hideIndicator && (
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  indicator === "dot" && "bg-primary",
                  indicator === "line" && "bg-primary",
                  indicator === "dashed" && "bg-primary"
                )}
              />
            )}
            <span className="text-muted-foreground">
              {labelKey}
            </span>
          </div>
        </div>
      )}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    children: React.ComponentProps<"div">["children"]
  }
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-wrap justify-center gap-3 text-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    name: string
    children: React.ComponentProps<"button">["children"]
  }
>(({ className, name, children, ...props }, ref) => {
  const { config } = useChart()

  return (
    <button
      ref={ref}
      className={cn(chartLegendVariants(), className)}
      {...props}
    >
      <div
        className="mr-2 h-2 w-2 rounded-[2px]"
        style={{
          backgroundColor: config[name]?.color || "hsl(var(--chart-1))",
        }}
      />
      {children}
    </button>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  chartVariants,
  chartLabelVariants,
  chartLegendVariants,
}
