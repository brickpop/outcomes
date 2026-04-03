import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  trackClassName?: string
  rangeClassName?: string
  rangeStyle?: React.CSSProperties
  thumbClassName?: string
  fillOrigin?: 'min' | 'center' | 'max'
}

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, trackClassName, rangeClassName, rangeStyle, thumbClassName, fillOrigin = 'min', value, min = 0, max = 1, ...props }, ref) => {
  const currentValue = value?.[0] ?? 0
  const range = (max as number) - (min as number)
  const valuePct = ((currentValue - (min as number)) / range) * 100

  const originPct =
    fillOrigin === 'max'    ? 100 :
    fillOrigin === 'center' ? ((0 - (min as number)) / range) * 100 :
    0

  const barLeft  = Math.min(originPct, valuePct)
  const barWidth = Math.abs(valuePct - originPct)

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center cursor-pointer",
        className
      )}
      value={value}
      min={min}
      max={max}
      {...props}
    >
      <SliderPrimitive.Track className={cn("relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20", trackClassName)}>
        {fillOrigin === 'min' ? (
          <SliderPrimitive.Range className={cn("absolute h-full bg-primary", rangeClassName)} style={rangeStyle} />
        ) : (
          <>
            <SliderPrimitive.Range className="absolute h-full bg-transparent" />
            <div
              className={cn("absolute h-full rounded-full bg-primary transition-all", rangeClassName)}
              style={{ left: `${barLeft}%`, width: `${barWidth}%`, ...rangeStyle }}
            />
          </>
        )}
      </SliderPrimitive.Track>
      {fillOrigin === 'center' && (
        <div
          className="pointer-events-none absolute h-2.5 w-px bg-muted-foreground/30"
          style={{ left: `${originPct}%` }}
        />
      )}
      <SliderPrimitive.Thumb className={cn("block h-4 w-4 cursor-pointer rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50", thumbClassName)} />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
