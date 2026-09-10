/* eslint-disable */
// @ts-nocheck
// This file is generated from the file routes. It is kept in sync for GitHub-only editing.
import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AuthRouteImport } from './routes/auth'
import { Route as InboxRouteImport } from './routes/inbox'
import { Route as CustomersRouteImport } from './routes/customers'
import { Route as KnowledgeRouteImport } from './routes/knowledge'
import { Route as AnalyticsRouteImport } from './routes/analytics'
import { Route as SettingsRouteImport } from './routes/settings'

const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const AuthRoute = AuthRouteImport.update({ id: '/auth', path: '/auth', getParentRoute: () => rootRouteImport } as any)
const InboxRoute = InboxRouteImport.update({ id: '/inbox', path: '/inbox', getParentRoute: () => rootRouteImport } as any)
const CustomersRoute = CustomersRouteImport.update({ id: '/customers', path: '/customers', getParentRoute: () => rootRouteImport } as any)
const KnowledgeRoute = KnowledgeRouteImport.update({ id: '/knowledge', path: '/knowledge', getParentRoute: () => rootRouteImport } as any)
const AnalyticsRoute = AnalyticsRouteImport.update({ id: '/analytics', path: '/analytics', getParentRoute: () => rootRouteImport } as any)
const SettingsRoute = SettingsRouteImport.update({ id: '/settings', path: '/settings', getParentRoute: () => rootRouteImport } as any)

export interface FileRoutesByFullPath { '/': typeof IndexRoute; '/auth': typeof AuthRoute; '/inbox': typeof InboxRoute; '/customers': typeof CustomersRoute; '/knowledge': typeof KnowledgeRoute; '/analytics': typeof AnalyticsRoute; '/settings': typeof SettingsRoute }
export interface FileRoutesByTo { '/': typeof IndexRoute; '/auth': typeof AuthRoute; '/inbox': typeof InboxRoute; '/customers': typeof CustomersRoute; '/knowledge': typeof KnowledgeRoute; '/analytics': typeof AnalyticsRoute; '/settings': typeof SettingsRoute }
export interface FileRoutesById { __root__: typeof rootRouteImport; '/': typeof IndexRoute; '/auth': typeof AuthRoute; '/inbox': typeof InboxRoute; '/customers': typeof CustomersRoute; '/knowledge': typeof KnowledgeRoute; '/analytics': typeof AnalyticsRoute; '/settings': typeof SettingsRoute }
export interface FileRouteTypes { fileRoutesByFullPath: FileRoutesByFullPath; fullPaths: '/' | '/auth' | '/inbox' | '/customers' | '/knowledge' | '/analytics' | '/settings'; fileRoutesByTo: FileRoutesByTo; to: '/' | '/auth' | '/inbox' | '/customers' | '/knowledge' | '/analytics' | '/settings'; id: '__root__' | '/' | '/auth' | '/inbox' | '/customers' | '/knowledge' | '/analytics' | '/settings'; fileRoutesById: FileRoutesById }
export interface RootRouteChildren { IndexRoute: typeof IndexRoute; AuthRoute: typeof AuthRoute; InboxRoute: typeof InboxRoute; CustomersRoute: typeof CustomersRoute; KnowledgeRoute: typeof KnowledgeRoute; AnalyticsRoute: typeof AnalyticsRoute; SettingsRoute: typeof SettingsRoute }
declare module '@tanstack/react-router' { interface FileRoutesByPath { '/': { id:'/'; path:'/'; fullPath:'/'; preLoaderRoute:typeof IndexRouteImport; parentRoute:typeof rootRouteImport }; '/auth': { id:'/auth'; path:'/auth'; fullPath:'/auth'; preLoaderRoute:typeof AuthRouteImport; parentRoute:typeof rootRouteImport }; '/inbox': { id:'/inbox'; path:'/inbox'; fullPath:'/inbox'; preLoaderRoute:typeof InboxRouteImport; parentRoute:typeof rootRouteImport }; '/customers': { id:'/customers'; path:'/customers'; fullPath:'/customers'; preLoaderRoute:typeof CustomersRouteImport; parentRoute:typeof rootRouteImport }; '/knowledge': { id:'/knowledge'; path:'/knowledge'; fullPath:'/knowledge'; preLoaderRoute:typeof KnowledgeRouteImport; parentRoute:typeof rootRouteImport }; '/analytics': { id:'/analytics'; path:'/analytics'; fullPath:'/analytics'; preLoaderRoute:typeof AnalyticsRouteImport; parentRoute:typeof rootRouteImport }; '/settings': { id:'/settings'; path:'/settings'; fullPath:'/settings'; preLoaderRoute:typeof SettingsRouteImport; parentRoute:typeof rootRouteImport } } }
const rootRouteChildren: RootRouteChildren = { IndexRoute, AuthRoute, InboxRoute, CustomersRoute, KnowledgeRoute, AnalyticsRoute, SettingsRoute }
export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>()
import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' { interface Register { ssr:true; router:Awaited<ReturnType<typeof getRouter>>; config:Awaited<ReturnType<typeof startInstance.getOptions>> } }
