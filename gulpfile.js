import { src, series } from 'gulp';
import awspublish from 'gulp-awspublish';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { buildOnce } from './build.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runBuild() {
  await buildOnce();
}

function publishBucket(bucket) {
  return function publishTask() {
    const credentialsPath = resolve(__dirname, '../aws-credentials.json');
    const aws = JSON.parse(readFileSync(credentialsPath, 'utf8'));
    aws.params = { Bucket: bucket };

    const publisher = awspublish.create(aws);
    const headers = { 'Cache-Control': 'no-cache, must-revalidate' };

    return src('dist/**')
      .pipe(awspublish.gzip())
      .pipe(publisher.publish(headers))
      .pipe(publisher.cache())
      .pipe(publisher.sync())
      .pipe(awspublish.reporter());
  };
}

export const build = runBuild;
export const publish = series(
  build,
  publishBucket('wwmc-map.mwater.co'),
  publishBucket('map.monitorwater.org')
);
export default build;

