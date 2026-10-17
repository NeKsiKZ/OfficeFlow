import { SpaceList } from './SpaceList'

export function SpacesPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Spaces
        </h1>
        <p className="max-w-2xl text-stone-600">
          Browse available desks, rooms, and parking spaces loaded from the
          OfficeFlow API.
        </p>
      </div>

      <SpaceList />
    </section>
  )
}
