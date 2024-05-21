require 'swagger_helper'

SAMPLE_SEASON = '2023-2024'
SAMPLE_EVENT = 'USILCHS1'

RSpec.describe 'api/v1/events', type: :request do
  path '/api/v1/{season}/events' do
    parameter name: 'season', in: :path, type: :string, description: 'Full season year'

    get('list events') do
      tags 'Events'
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }

        produces 'application/json'
        schema type: :array, items: { '$ref' => '#/components/schemas/event' }

        after do |example|
          example.metadata[:response][:content] = {
            'application/json' => {
              example: JSON.parse(response.body, symbolize_names: true)
            }
          }
        end
        run_test!
      end
    end
  end

  path '/api/v1/{season}/events/{slug}' do
    parameter name: 'season', in: :path, type: :string, description: 'Full season year'
    parameter name: 'slug', in: :path, type: :string, description: 'slug'

    get('show event') do
      tags 'Events'
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }
        let(:slug) { SAMPLE_EVENT }

        produces 'application/json'
        schema '$ref' => '#/components/schemas/event'

        after do |example|
          example.metadata[:response][:content] = {
            'application/json' => {
              example: JSON.parse(response.body, symbolize_names: true)
            }
          }
        end
        run_test!
      end
    end
  end

  path '/api/v1/{season}/events/{slug}/matches' do
    # You'll want to customize the parameter types...
    parameter name: 'season', in: :path, type: :string, description: 'Full season year'
    parameter name: 'slug', in: :path, type: :string, description: 'slug'

    get('view_matches event') do
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }
        let(:slug) { SAMPLE_EVENT }

        after do |example|
          example.metadata[:response][:content] = {
            'application/json' => {
              example: JSON.parse(response.body, symbolize_names: true)
            }
          }
        end
        run_test!
      end
    end
  end

  path '/api/v1/{season}/events/{slug}/rankings' do
    # You'll want to customize the parameter types...
    parameter name: 'season', in: :path, type: :string, description: 'Full season year'
    parameter name: 'slug', in: :path, type: :string, description: 'slug'

    get('view_rankings event') do
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }
        let(:slug) { SAMPLE_EVENT }

        after do |example|
          example.metadata[:response][:content] = {
            'application/json' => {
              example: JSON.parse(response.body, symbolize_names: true)
            }
          }
        end
        run_test!
      end
    end
  end

  path '/api/v1/{season}/events/{slug}/awards' do
    # You'll want to customize the parameter types...
    parameter name: 'season', in: :path, type: :string, description: 'Full season year'
    parameter name: 'slug', in: :path, type: :string, description: 'slug'

    get('view_awards event') do
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }
        let(:slug) { SAMPLE_EVENT }

        after do |example|
          example.metadata[:response][:content] = {
            'application/json' => {
              example: JSON.parse(response.body, symbolize_names: true)
            }
          }
        end
        run_test!
      end
    end
  end

  path '/api/v1/{season}/events/{slug}/alliances' do
    # You'll want to customize the parameter types...
    parameter name: 'season', in: :path, type: :string, description: 'Full season year'
    parameter name: 'slug', in: :path, type: :string, description: 'slug'

    get('view_alliances event') do
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }
        let(:slug) { SAMPLE_EVENT }

        after do |example|
          example.metadata[:response][:content] = {
            'application/json' => {
              example: JSON.parse(response.body, symbolize_names: true)
            }
          }
        end
        run_test!
      end
    end
  end

  path '/api/v1/{season}/events/{slug}/teams' do
    # You'll want to customize the parameter types...
    parameter name: 'season', in: :path, type: :string, description: 'Full season year'
    parameter name: 'slug', in: :path, type: :string, description: 'slug'

    get('view_teams event') do
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }
        let(:slug) { SAMPLE_EVENT }

        after do |example|
          example.metadata[:response][:content] = {
            'application/json' => {
              example: JSON.parse(response.body, symbolize_names: true)
            }
          }
        end
        run_test!
      end
    end
  end
end
