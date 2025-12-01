export function DecorativeDivider() {
  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-center">
          {/* Left line */}
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-primary/30" />

          {/* Center decorative element */}
          <div className="px-4">
            <div className="relative">
              <div className="w-6 h-6 rounded-full border-2 border-primary/30 bg-background" />
            </div>
          </div>

          {/* Right line */}
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary/30 to-primary/30" />
        </div>
      </div>
    </div>
  )
}