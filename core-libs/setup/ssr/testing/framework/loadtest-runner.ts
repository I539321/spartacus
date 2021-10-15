import loadtest from 'loadtest';
import { LoadtestConfig } from './loadtest-config';
import {
  LoadtestResponse,
  LoadtestResponseHandler,
  LoadtestSuccessResponse,
} from './loadtest-response-handler';
import { LoadtestResult } from './loadtest-result';

/**
 * Wrapper class for the 'loadtest' tool.
 */
export class LoadtestRunner {
  /**
   * Runs the test using the `loadtest` tool, parametrized with the given config.
   *
   * Returns a Promise which resolves with test results.
   */
  run(testConfig: LoadtestConfig): Promise<LoadtestResult> {
    let {
      host,
      totalRequests,
      concurrencyLimit,
      requestGenerator,
      responseHandler,
    } = testConfig;
    responseHandler = responseHandler ?? new LoadtestResponseHandler();
    this.logStart(testConfig);

    return new Promise((resolve, reject) => {
      const responses: LoadtestResponse[] = [];
      loadtest.loadTest(
        {
          url: host,
          maxRequests: totalRequests,
          concurrency: concurrencyLimit,

          requestGenerator: requestGenerator.generateRequest.bind(
            requestGenerator
          ),

          statusCallback: (error: any, result: LoadtestSuccessResponse) => {
            responses.push({ error, result });
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            responseHandler!.handleResponse(error, result);
          },
        },
        (error: any, _finalResult: any) => {
          // workaround: wait with returning the final result until the last `statusCallback` executes:
          setTimeout(() => {
            const testResults = new LoadtestResult(responses);
            this.logEnd(error, testResults);

            if (error) {
              reject({ error, results: testResults });
            } else {
              resolve(testResults);
            }
          });
        }
      );
    });
  }

  /**
   * Logs the start of the test.
   */
  protected logStart({
    host,
    totalRequests,
    concurrencyLimit,
    requestGenerator,
  }: LoadtestConfig) {
    console.log('Test started with the config:', {
      host,
      totalRequests,
      concurrencyLimit,
      requestGenerator: requestGenerator.description,
    });
  }

  /**
   * Logs the end of the test
   */
  protected logEnd(error: any, results: LoadtestResult) {
    if (error) {
      console.error('Test got an error: %s', error);
    } else {
      console.log('Test run successfully!');
    }

    console.log('CSR fallbacks count:', results.getCacheNoStoreCount);
    console.log('Response times in ms:', {
      avg: results.avgResponseTime,
      max: results.maxResponseTime,
      min: results.minResponseTime,
    });
  }
}
