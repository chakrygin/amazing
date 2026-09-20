import { App } from '@core/App';

// dotnet
import { AndrewLockScraper } from './dotnet/AndrewLockScraper';
import { BreslavLozhechkinScraper } from './dotnet/BreslavLozhechkinScraper';
import { CodeOpinionScraper } from './dotnet/CodeOpinionScraper';
import { JetBrainsBlogScraper } from './dotnet/JetBrainsBlogScraper';
import { MeziantouScraper } from './dotnet/MeziantouScraper';
import { RadioDotNetScraper } from './dotnet/RadioDotNetScraper';
import { StevenGieselScraper } from './dotnet/StevenGieselScraper';

// shared
import { DevBlogsScraper } from './shared/DevBlogsScraper';
import { HabrScraper } from './shared/HabrScraper';

const app = new App({
  'dotnet': [
    new AndrewLockScraper(),
    new BreslavLozhechkinScraper(),
    new CodeOpinionScraper(),
    new DevBlogsScraper('dotnet'),
    new DevBlogsScraper('visualstudio'),
    new HabrScraper('net'),
    new HabrScraper('csharp'),
    new HabrScraper('fsharp'),
    new JetBrainsBlogScraper(),
    new MeziantouScraper(),
    new RadioDotNetScraper(),
    new StevenGieselScraper(),
  ],
  // 'frontend': [
  //   new DevBlogsScraper('typescript'),
  // ],
});

await app.run();
