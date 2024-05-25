require 'swagger_helper'

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
    parameter name: 'slug', in: :path, type: :string

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
    parameter name: 'slug', in: :path, type: :string

    get('show event matches') do
      tags 'Events'
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }
        let(:slug) { SAMPLE_EVENT }

        produces 'application/json'
        schema oneOf: [
          {type: :array, items: { '$ref' => '#/components/schemas/match' }},
          {type: :array, items: { '$ref' => '#/components/schemas/remoteMatch' }}
        ]

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
    parameter name: 'slug', in: :path, type: :string

    get('show event rankings') do
      tags 'Events'
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }
        let(:slug) { SAMPLE_EVENT }

        produces 'application/json'
        schema type: :array, items: { '$ref' => '#/components/schemas/ranking' }

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
    parameter name: 'slug', in: :path, type: :string

    get('show event awards') do
      tags 'Events'
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }
        let(:slug) { SAMPLE_EVENT }

        produces 'application/json'
        schema type: :array, items: { '$ref' => '#/components/schemas/award' }

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
    parameter name: 'slug', in: :path, type: :string

    get('show event alliances') do
      tags 'Events'
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }
        let(:slug) { SAMPLE_EVENT }

        produces 'application/json'
        schema type: :object, properties: {
          alliances: { type: :array, items: { '$ref' => '#/components/schemas/alliance' } },
          rankings: { type: :array, items: { '$ref' => '#/components/schemas/elimRanking' } }
        }

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
    parameter name: 'season', in: :path, type: :string, description: 'Full season year'
    parameter name: 'slug', in: :path, type: :string

    get('show event teams') do
      tags 'Events'
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }
        let(:slug) { SAMPLE_EVENT }

        produces 'application/json'
        schema type: :array, items: {
          type: :object,
          properties: {
            division: { type: %i[string null] },
            number: { type: :number }
          },
          required: %i[number division]
        }

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
