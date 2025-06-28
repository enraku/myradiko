const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const RadikoAPI = require('../utils/RadikoAPI');

class RadikoRecorder {
    constructor() {
        this.radikoAPI = new RadikoAPI();
        this.activeRecordings = new Map();
        this.recordingsDir = path.join(__dirname, '../../recordings');
        
        // 録音ディレクトリの作成
        this.ensureRecordingsDirectory();
    }

    // 録音ディレクトリの確認・作成
    async ensureRecordingsDirectory() {
        try {
            await fs.access(this.recordingsDir);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.mkdir(this.recordingsDir, { recursive: true });
                console.log(`Created recordings directory: ${this.recordingsDir}`);
            } else {
                throw error;
            }
        }
    }

    // 録音開始
    async startRecording({ stationId, duration, title, historyId }) {
        try {
            console.log(`Starting recording: ${title} (Station: ${stationId}, Duration: ${duration}s)`);
            
            // ファイル名生成
            const now = new Date();
            const dateStr = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
            const filename = `${stationId}_${dateStr}_${this.sanitizeFilename(title)}.m4a`;
            const outputPath = path.join(this.recordingsDir, filename);
            
            // radiko録音コマンドの準備
            const recordingProcess = await this.startRadikoRecording(stationId, duration, outputPath);
            
            const recording = {
                id: `rec_${historyId}_${Date.now()}`,
                stationId,
                title,
                filename,
                outputPath,
                process: recordingProcess,
                startTime: now,
                duration,
                historyId,
                status: 'recording'
            };
            
            this.activeRecordings.set(recording.id, recording);
            
            // プロセス終了時の処理
            recordingProcess.on('close', async (code) => {
                await this.handleRecordingComplete(recording, code);
            });
            
            recordingProcess.on('error', async (error) => {
                await this.handleRecordingError(recording, error);
            });
            
            return recording;
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw error;
        }
    }

    // radiko録音プロセス開始
    async startRadikoRecording(stationId, duration, outputPath) {
        // radikoレコーダーのコマンド構築
        // 注意: 実際の実装では適切なradiko録音ツールを使用してください
        // この例では基本的な構造のみ示しています
        
        const args = [
            'rec',
            '--station', stationId,
            '--duration', duration.toString(),
            '--output', outputPath,
            '--format', 'm4a'
        ];
        
        // 実際のradiko録音ツールの実行
        // この例では仮想的なコマンドを使用
        const process = spawn('radiko-recorder', args, {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        process.stdout.on('data', (data) => {
            console.log(`Recording output: ${data}`);
        });
        
        process.stderr.on('data', (data) => {
            console.error(`Recording error: ${data}`);
        });
        
        return process;
    }

    // 録音停止
    async stopRecording(recording) {
        try {
            if (!recording || !recording.process) {
                console.log('No recording process to stop');
                return;
            }
            
            console.log(`Stopping recording: ${recording.title}`);
            
            // プロセス終了
            if (!recording.process.killed) {
                recording.process.kill('SIGTERM');
                
                // 強制終了のタイムアウト
                setTimeout(() => {
                    if (!recording.process.killed) {
                        recording.process.kill('SIGKILL');
                    }
                }, 5000);
            }
            
            this.activeRecordings.delete(recording.id);
            
        } catch (error) {
            console.error('Failed to stop recording:', error);
            throw error;
        }
    }

    // 録音完了処理
    async handleRecordingComplete(recording, exitCode) {
        try {
            console.log(`Recording completed: ${recording.title} (Exit code: ${exitCode})`);
            
            recording.status = exitCode === 0 ? 'completed' : 'failed';
            recording.endTime = new Date();
            
            // ファイル存在確認
            try {
                const stats = await fs.stat(recording.outputPath);
                recording.fileSize = stats.size;
                
                if (stats.size > 0) {
                    console.log(`Recording file saved: ${recording.outputPath} (${stats.size} bytes)`);
                } else {
                    console.warn(`Recording file is empty: ${recording.outputPath}`);
                    recording.status = 'failed';
                }
            } catch (error) {
                console.error(`Recording file not found: ${recording.outputPath}`);
                recording.status = 'failed';
            }
            
            this.activeRecordings.delete(recording.id);
            
        } catch (error) {
            console.error('Failed to handle recording completion:', error);
        }
    }

    // 録音エラー処理
    async handleRecordingError(recording, error) {
        try {
            console.error(`Recording error: ${recording.title}`, error);
            
            recording.status = 'failed';
            recording.error = error.message;
            recording.endTime = new Date();
            
            this.activeRecordings.delete(recording.id);
            
        } catch (handleError) {
            console.error('Failed to handle recording error:', handleError);
        }
    }

    // ファイル名のサニタイズ
    sanitizeFilename(filename) {
        return filename
            .replace(/[<>:"/\\|?*]/g, '_')
            .replace(/\s+/g, '_')
            .substring(0, 100);
    }

    // アクティブな録音一覧取得
    getActiveRecordings() {
        return Array.from(this.activeRecordings.values()).map(recording => ({
            id: recording.id,
            stationId: recording.stationId,
            title: recording.title,
            filename: recording.filename,
            startTime: recording.startTime,
            duration: recording.duration,
            status: recording.status
        }));
    }

    // 録音停止（ID指定）
    async stopRecordingById(recordingId) {
        const recording = this.activeRecordings.get(recordingId);
        if (recording) {
            await this.stopRecording(recording);
            return true;
        }
        return false;
    }

    // 全録音停止
    async stopAllRecordings() {
        const recordings = Array.from(this.activeRecordings.values());
        
        for (const recording of recordings) {
            await this.stopRecording(recording);
        }
        
        console.log(`Stopped ${recordings.length} active recordings`);
    }
}

module.exports = RadikoRecorder;