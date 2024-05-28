import { RestClient, AuthenticationStorage } from '@directus/sdk'
import { Database } from './DatabaseDefinitions'

declare global
{
	namespace App
	{
		interface Locals
		{
			directus: RestClient<Database>
			getSession (): Promise<Session | null>
		}
		interface PageData
		{
			session: Session | null
		}
		// interface Error {}
		// interface Platform {}
	}
}