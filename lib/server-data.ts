import { notFound } from "next/navigation"
import { connection } from "next/server"
import { isStatus } from "./http"

/**
 * Runs an API read from a Server Component at request time (never during the build),
 * turning a 404 into the route's not-found page. Wrap the caller in <Suspense> with a skeleton.
 */
export async function load<T>(read: () => Promise<T>): Promise<T> {
  await connection()
  try {
    return await read()
  } catch (error) {
    if (isStatus(error, 404)) notFound()
    throw error
  }
}
